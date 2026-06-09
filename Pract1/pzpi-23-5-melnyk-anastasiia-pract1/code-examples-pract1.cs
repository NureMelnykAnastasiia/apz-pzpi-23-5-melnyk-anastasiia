public class Student
{
    public string Name { get; set; }
    public int Grade { get; set; }

    public Student(string name, int grade)
    {
        Name = name;
        Grade = grade;
    }
}
public interface IIterator<T>
{
    bool HasNext();
    T Next();
}

public interface ICollection<T>
{
    IIterator<T> CreateIterator();
}

public class StudentIterator : IIterator<Student>
{
    private List<Student> _students;
    private int _position = 0;

    public StudentIterator(List<Student> students)
    {
        _students = students;
    }

    public bool HasNext()
    {
        return _position < _students.Count;
    }

    public Student Next()
    {
        return _students[_position++];
    }
}

public class StudentCollection : ICollection<Student>
{
    private List<Student> _students = new List<Student>();

    public void Add(Student student)
    {
        _students.Add(student);
    }

    public IIterator<Student> CreateIterator()
    {
        return new StudentIterator(_students);
    }
}
class Program
{
    static void Main()
    {
        StudentCollection collection = new StudentCollection();

        collection.Add(new Student("Іван", 90));
        collection.Add(new Student("Оля", 75));
        collection.Add(new Student("Андрій", 85));
        collection.Add(new Student("Марія", 95));

        IIterator<Student> iterator = collection.CreateIterator();

        while (iterator.HasNext())
        {
            Student s = iterator.Next();
            Console.WriteLine($"{s.Name} - {s.Grade}");
        }
    }
}
/*class Program
{
    static void Main()
    {
        List<Student> students = new List<Student>
        {
            new Student("Іван", 90),
            new Student("Оля", 75),
            new Student("Андрій", 85),
            new Student("Марія", 95)
        };

        for (int i = 0; i < students.Count; i++)
        {
            Console.WriteLine(students[i].Name);
        }
        for (int i = students.Count - 1; i >= 0; i--)
        {
            Console.WriteLine(students[i].Name);
        }

        for (int i = 0; i < students.Count; i++)
        {
            if (students[i].Grade > 80)
            {
                Console.WriteLine(students[i].Name);
            }
        }
    }
}*/